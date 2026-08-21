import sys


SERVICE = "ProofSLA Bradbury API execution test"
REQUIREMENTS = (
    "The provider must return HTTP 200 and the response body must contain "
    "the exact text PROOFSLA_OK."
)
ESCROW = 10_000


def _runtime_address(contract, raw):
    instance = object.__getattribute__(contract, "_instance")
    contract_module = sys.modules[type(instance).__module__]
    Address = contract_module.Address
    return Address(raw)


def _as_studio_integer(raw: bytes) -> int:
    return int.from_bytes(raw, "big")


def test_bradbury_integer_encoded_provider_is_normalized(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    direct_vm.check_pickling = True
    contract = direct_deploy("contracts/proofsla.py")
    U = type(contract.next_sla_id)

    direct_vm.sender = direct_alice
    direct_vm.value = ESCROW

    sla_id = contract.create_sla(
        _as_studio_integer(direct_bob),
        SERVICE,
        REQUIREMENTS,
        U(8000),
        U(2000),
        U(86400),
    )
    direct_vm.value = 0

    sla = contract.get_sla(sla_id)

    assert sla.provider == _runtime_address(contract, direct_bob)
    assert contract.get_sla_count() == U(1)

    contract.cancel_unaccepted_sla(sla_id)

    # Studio may encode Address view arguments using the same integer form.
    assert contract.get_claimable(_as_studio_integer(direct_alice)) == U(ESCROW)


def test_bradbury_integer_encoded_provider_cannot_bypass_role_separation(
    direct_vm,
    direct_deploy,
    direct_alice,
):
    direct_vm.check_pickling = True
    contract = direct_deploy("contracts/proofsla.py")
    U = type(contract.next_sla_id)

    direct_vm.sender = direct_alice
    direct_vm.value = ESCROW

    with direct_vm.expect_revert("client and provider must be different"):
        contract.create_sla(
            _as_studio_integer(direct_alice),
            SERVICE,
            REQUIREMENTS,
            U(8000),
            U(2000),
            U(86400),
        )

    direct_vm.value = 0
