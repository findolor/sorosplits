use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 101,
    AlreadyInitialized = 102,
    Unauthorized = 103,
    ContractLocked = 104,
    LowShareCount = 105,
    SelfShareNotAllowed = 106,
    InvalidShareTotal = 107,
    // Token distribution errors
    InsufficientBalance = 108,
    // Token transfer errors
    ZeroTransferAmount = 109,
    TransferAmountAboveBalance = 110,
    TransferAmountAboveUnusedBalance = 111,
    // Token withdrawal errors
    ZeroWithdrawalAmount = 112,
    WithdrawalAmountAboveAllocation = 113,
    // Token whitelist errors
    TokenNotWhitelisted = 114,
}
