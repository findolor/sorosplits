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
    // Token distribution errors
    InsufficientBalance = 7,
    // Token transfer errors
    ZeroTransferAmount = 8,
    TransferAmountAboveBalance = 9,
    TransferAmountAboveUnusedBalance = 10,
    // Token withdrawal errors
    ZeroWithdrawalAmount = 11,
    WithdrawalAmountAboveAllocation = 12,
    // Token whitelist errors
    TokenNotWhitelisted = 13,
}
