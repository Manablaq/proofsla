import hashlib
import json


PRIMARY_URL = "https://evidence.example/run-001-primary.txt"
CORROBORATION_URL = "https://evidence.example/run-001-corroboration.txt"

PRIMARY_BODY = (
    "Run run-001 completed. All five requested due-diligence sections were "
    "returned with three cited sources in 42 seconds."
)

CORROBORATION_BODY = (
    "Independent execution log for run-001: request completed in 42 seconds, "
    "five output sections present, and three source references recorded."
)

PRIMARY_SHA = hashlib.sha256(PRIMARY_BODY.encode("utf-8")).hexdigest()
CORROBORATION_SHA = hashlib.sha256(
    CORROBORATION_BODY.encode("utf-8")
).hexdigest()

SERVICE = "AI research API execution for a five-section due-diligence report"

REQUIREMENTS = (
    "Return all five requested sections, include at least three sources, "
    "complete successfully, and finish within 60 seconds."
)

ESCROW = 10_000

TEST_TIME_ISO = "2026-08-21T03:00:00Z"
TEST_TIME_UNIX = 1787281200


def _runtime_address(contract, raw):
    import sys

    instance = object.__getattribute__(contract, "_instance")
    contract_module = sys.modules[type(instance).__module__]
    Address = contract_module.Address
    return Address(raw)


def _create(
    direct_vm,
    direct_deploy,
    client,
    provider,
):
    direct_vm.check_pickling = True
    direct_vm.warp(TEST_TIME_ISO)

    contract = direct_deploy("contracts/proofsla.py")
    U = type(contract.next_sla_id)

    direct_vm.sender = client
    direct_vm.value = ESCROW

    sla_id = contract.create_sla(
        _runtime_address(contract, provider),
        SERVICE,
        REQUIREMENTS,
        U(7500),
        U(2500),
        U(3600),
    )

    direct_vm.value = 0

    return contract, sla_id, U


def _activate(
    direct_vm,
    direct_deploy,
    client,
    provider,
):
    contract, sla_id, U = _create(
        direct_vm,
        direct_deploy,
        client,
        provider,
    )

    with direct_vm.prank(provider):
        contract.accept_sla(sla_id)

    return contract, sla_id, U


def _complete(
    contract,
    direct_vm,
    provider,
    sla_id,
    U,
):
    with direct_vm.prank(provider):
        contract.submit_delivery_evidence(
            sla_id,
            PRIMARY_URL,
            PRIMARY_SHA,
            CORROBORATION_URL,
            CORROBORATION_SHA,
            U(TEST_TIME_UNIX),
        )


def _mock_evidence(direct_vm):
    direct_vm.mock_web(
        r"evidence\.example/run-001-primary\.txt",
        {
            "status": 200,
            "body": PRIMARY_BODY,
        },
    )

    direct_vm.mock_web(
        r"evidence\.example/run-001-corroboration\.txt",
        {
            "status": 200,
            "body": CORROBORATION_BODY,
        },
    )


def _mock_judgment(
    direct_vm,
    verdict,
    evidence_status="CORROBORATED",
    reason="controlled test judgment",
):
    direct_vm.mock_llm(
        r".*",
        json.dumps(
            {
                "verdict": verdict,
                "evidence_status": evidence_status,
                "reason": reason,
            }
        ),
    )


def test_public_role_authorization_is_enforced(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
    direct_charlie,
):
    contract, sla_id, U = _create(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    with direct_vm.prank(direct_charlie):
        with direct_vm.expect_revert("only provider can accept"):
            contract.accept_sla(sla_id)

    with direct_vm.prank(direct_bob):
        contract.accept_sla(sla_id)

    with direct_vm.expect_revert(
        "only provider can submit delivery evidence"
    ):
        contract.submit_delivery_evidence(
            sla_id,
            PRIMARY_URL,
            PRIMARY_SHA,
            CORROBORATION_URL,
            CORROBORATION_SHA,
            U(TEST_TIME_UNIX),
        )

    _complete(
        contract,
        direct_vm,
        direct_bob,
        sla_id,
        U,
    )

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert(
            "only client can open adjudication in v1"
        ):
            contract.adjudicate(sla_id)

    assert contract.get_sla(sla_id).state == "COMPLETED"


def test_invalid_evidence_reference_is_rejected(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert(
            "evidence URL must use https"
        ):
            contract.submit_delivery_evidence(
                sla_id,
                "http://evidence.example/insecure.txt",
                PRIMARY_SHA,
                CORROBORATION_URL,
                CORROBORATION_SHA,
                U(TEST_TIME_UNIX),
            )

        with direct_vm.expect_revert(
            "evidence SHA-256 must be 64 hex characters"
        ):
            contract.submit_delivery_evidence(
                sla_id,
                PRIMARY_URL,
                "abc123",
                CORROBORATION_URL,
                CORROBORATION_SHA,
                U(TEST_TIME_UNIX),
            )

    assert contract.get_sla(sla_id).state == "ACTIVE"


def test_same_primary_and_corroboration_reference_is_rejected(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert(
            "corroboration must be an independent evidence reference"
        ):
            contract.submit_delivery_evidence(
                sla_id,
                PRIMARY_URL,
                PRIMARY_SHA,
                PRIMARY_URL,
                PRIMARY_SHA,
                U(TEST_TIME_UNIX),
            )

    assert contract.get_sla(sla_id).state == "ACTIVE"


def test_future_evidence_timestamp_is_rejected(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert(
            "evidence timestamp cannot be in the future"
        ):
            contract.submit_delivery_evidence(
                sla_id,
                PRIMARY_URL,
                PRIMARY_SHA,
                CORROBORATION_URL,
                CORROBORATION_SHA,
                U(TEST_TIME_UNIX + 1),
            )

    assert contract.get_sla(sla_id).state == "ACTIVE"


def test_stale_evidence_is_rejected(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert(
            "evidence is stale under this SLA"
        ):
            contract.submit_delivery_evidence(
                sla_id,
                PRIMARY_URL,
                PRIMARY_SHA,
                CORROBORATION_URL,
                CORROBORATION_SHA,
                U(TEST_TIME_UNIX - 3601),
            )

    assert contract.get_sla(sla_id).state == "ACTIVE"


def test_public_adjudicate_minor_breach_uses_deterministic_split(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    _complete(
        contract,
        direct_vm,
        direct_bob,
        sla_id,
        U,
    )

    _mock_evidence(direct_vm)
    _mock_judgment(direct_vm, "MINOR_BREACH")

    contract.adjudicate(sla_id)

    assert direct_vm.run_validator() is True

    sla = contract.get_sla(sla_id)

    assert sla.state == "RESOLVED"
    assert sla.verdict == "MINOR_BREACH"
    assert sla.evidence_status == "CORROBORATED"

    assert sla.provider_award == U(7500)
    assert sla.client_award == U(2500)

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_bob)
        )
        == U(7500)
    )

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_alice)
        )
        == U(2500)
    )


def test_public_adjudicate_major_breach_uses_deterministic_split(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    _complete(
        contract,
        direct_vm,
        direct_bob,
        sla_id,
        U,
    )

    _mock_evidence(direct_vm)
    _mock_judgment(direct_vm, "MAJOR_BREACH")

    contract.adjudicate(sla_id)

    assert direct_vm.run_validator() is True

    sla = contract.get_sla(sla_id)

    assert sla.state == "RESOLVED"
    assert sla.verdict == "MAJOR_BREACH"
    assert sla.evidence_status == "CORROBORATED"

    assert sla.provider_award == U(2500)
    assert sla.client_award == U(7500)

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_bob)
        )
        == U(2500)
    )

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_alice)
        )
        == U(7500)
    )


def test_conflicting_evidence_public_path_refunds_client(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    _complete(
        contract,
        direct_vm,
        direct_bob,
        sla_id,
        U,
    )

    _mock_evidence(direct_vm)

    # Even though the model says MET, a non-corroborated evidence status
    # must dominate and normalize the economic verdict to insufficient.
    _mock_judgment(
        direct_vm,
        "MET",
        evidence_status="CONFLICTING",
        reason="the two records materially conflict",
    )

    contract.adjudicate(sla_id)

    assert direct_vm.run_validator() is True

    sla = contract.get_sla(sla_id)

    assert sla.state == "RESOLVED"
    assert sla.verdict == "INSUFFICIENT_EVIDENCE"
    assert sla.evidence_status == "CONFLICTING"

    assert sla.provider_award == U(0)
    assert sla.client_award == U(ESCROW)

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_bob)
        )
        == U(0)
    )

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_alice)
        )
        == U(ESCROW)
    )


def test_malformed_llm_verdict_fails_without_settlement(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    _complete(
        contract,
        direct_vm,
        direct_bob,
        sla_id,
        U,
    )

    _mock_evidence(direct_vm)
    _mock_judgment(
        direct_vm,
        "UNSUPPORTED_VERDICT",
    )

    with direct_vm.expect_revert(
        "LLM returned invalid verdict"
    ):
        contract.adjudicate(sla_id)

    sla = contract.get_sla(sla_id)

    assert sla.state == "COMPLETED"
    assert sla.verdict == ""
    assert sla.provider_award == U(0)
    assert sla.client_award == U(0)

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_alice)
        )
        == U(0)
    )

    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_bob)
        )
        == U(0)
    )


def test_public_adjudicate_validator_detects_changed_judgment(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, sla_id, U = _activate(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    _complete(
        contract,
        direct_vm,
        direct_bob,
        sla_id,
        U,
    )

    _mock_evidence(direct_vm)
    _mock_judgment(
        direct_vm,
        "MET",
        reason="leader judges the SLA fully satisfied",
    )

    contract.adjudicate(sla_id)

    # Direct Mode has captured the validator closure. Replace its
    # nondeterministic environment with the same evidence but a materially
    # different settlement-critical judgment.
    direct_vm.clear_mocks()

    _mock_evidence(direct_vm)
    _mock_judgment(
        direct_vm,
        "MAJOR_BREACH",
        reason="validator independently judges a core requirement failed",
    )

    assert direct_vm.run_validator() is False
