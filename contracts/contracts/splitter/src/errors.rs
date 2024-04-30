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
    SelfShareNotAllowed = 6,
    InvalidShareTotal = 7,
    // Token distribution errors
    InsufficientBalance = 8,
    // Token transfer errors
    ZeroTransferAmount = 9,
    TransferAmountAboveBalance = 10,
    TransferAmountAboveUnusedBalance = 11,
    // Token withdrawal errors
    ZeroWithdrawalAmount = 12,
    WithdrawalAmountAboveAllocation = 13,
    // Token whitelist errors
    TokenNotWhitelisted = 14,
}
