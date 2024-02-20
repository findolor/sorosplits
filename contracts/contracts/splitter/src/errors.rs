use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    ContractLocked = 4,
    LowShareCount = 5,
    InvalidShareTotal = 6,
    // Token transfer errors
    ZeroTransferAmount = 7,
    TransferAmountAboveBalance = 8,
    TransferAmountAboveUnusedBalance = 9,
    // Token withdrawal errors
    ZeroWithdrawalAmount = 10,
    WithdrawalAmountAboveAllocation = 11,
}
