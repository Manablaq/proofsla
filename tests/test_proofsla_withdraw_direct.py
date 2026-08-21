SERVICE = "AI research API execution for a five-section due-diligence report"

REQUIREMENTS = (
    "Return all five requested sections, include at least three sources, "
    "complete successfully, and finish within 60 seconds."
)

ESCROW = 10_000


def _runtime_address(contract, raw):
    import sys

    instance = object.__getattribute__(contract, "_instance")
    contract_module = sys.modules[type(instance).__module__]
    Address = contract_module.Address
    return Address(raw)


def _create_and_cancel(
    direct_vm,
    direct_deploy,
    client,
    provider,
):
    direct_vm.check_pickling = True

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
    contract.cancel_unaccepted_sla(sla_id)

    return contract, U


def test_withdraw_rejects_when_nothing_is_claimable(
    direct_vm,
    direct_deploy,
    direct_alice,
):
    direct_vm.check_pickling = True

    contract = direct_deploy("contracts/proofsla.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("nothing to withdraw"):
        contract.withdraw()


def test_withdraw_rejects_when_contract_balance_is_insufficient(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    contract, U = _create_and_cancel(
        direct_vm,
        direct_deploy,
        direct_alice,
        direct_bob,
    )

    # create_sla's Direct Mode gl.message.value does not itself populate
    # VMContext._balances. The cancelled escrow is claimable in contract
    # storage, while self.balance is therefore still zero.
    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_alice)
        )
        == U(ESCROW)
    )

    with direct_vm.expect_revert(
        "contract balance is insufficient"
    ):
        contract.withdraw()

    # Failed withdrawal must leave the claim intact.
    assert (
        contract.get_claimable(
            _runtime_address(contract, direct_alice)
        )
        == U(ESCROW)
    )
