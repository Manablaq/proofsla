PRIMARY_URL = "https:" + "//evidence.example/run-001-primary.txt"
CORROBORATION_URL = "https:" + "//evidence.example/run-001-corroboration.txt"

PRIMARY_SHA = "a" * 64
CORROBORATION_SHA = "b" * 64

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


def _create_sla(contract, direct_vm, client, provider):
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

    # Subsequent calls are non-payable.
    direct_vm.value = 0

    return sla_id, U


def test_create_and_cancel_unaccepted_sla(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    direct_vm.check_pickling = True
    direct_vm.warp(TEST_TIME_ISO)

    contract = direct_deploy("contracts/proofsla.py")

    sla_id, U = _create_sla(
        contract,
        direct_vm,
        direct_alice,
        direct_bob,
    )

    assert sla_id == U(1)
    assert contract.get_sla_count() == U(1)

    sla = contract.get_sla(sla_id)

    assert sla.client.as_bytes == direct_alice
    assert sla.provider.as_bytes == direct_bob
    assert sla.escrow_amount == U(ESCROW)
    assert sla.state == "CREATED"

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert("only client can cancel"):
            contract.cancel_unaccepted_sla(sla_id)

    contract.cancel_unaccepted_sla(sla_id)

    sla = contract.get_sla(sla_id)
    assert sla.state == "CANCELLED"
    assert contract.get_claimable(_runtime_address(contract, direct_alice)) == U(ESCROW)
    assert contract.get_claimable(_runtime_address(contract, direct_bob)) == U(0)

    with direct_vm.expect_revert("only unaccepted SLAs can be cancelled"):
        contract.cancel_unaccepted_sla(sla_id)


def test_client_acceptance_settles_full_escrow_to_provider(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    direct_vm.check_pickling = True
    direct_vm.warp(TEST_TIME_ISO)

    contract = direct_deploy("contracts/proofsla.py")

    sla_id, U = _create_sla(
        contract,
        direct_vm,
        direct_alice,
        direct_bob,
    )

    with direct_vm.prank(direct_bob):
        contract.accept_sla(sla_id)

    sla = contract.get_sla(sla_id)
    assert sla.state == "ACTIVE"

    with direct_vm.prank(direct_bob):
        contract.submit_delivery_evidence(
            sla_id,
            PRIMARY_URL,
            PRIMARY_SHA,
            CORROBORATION_URL,
            CORROBORATION_SHA,
            U(TEST_TIME_UNIX),
        )

    sla = contract.get_sla(sla_id)
    assert sla.state == "COMPLETED"
    assert sla.primary_evidence_url == PRIMARY_URL
    assert sla.corroboration_url == CORROBORATION_URL

    contract.accept_delivery(sla_id)

    sla = contract.get_sla(sla_id)

    assert sla.state == "RESOLVED"
    assert sla.verdict == "MET"
    assert sla.evidence_status == "CORROBORATED"
    assert sla.provider_award == U(ESCROW)
    assert sla.client_award == U(0)

    assert contract.get_claimable(_runtime_address(contract, direct_bob)) == U(ESCROW)
    assert contract.get_claimable(_runtime_address(contract, direct_alice)) == U(0)

    with direct_vm.expect_revert("delivery is not awaiting acceptance"):
        contract.accept_delivery(sla_id)
