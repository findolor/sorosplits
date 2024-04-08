use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    NotActive = 2,
    NotAllowed = 3,
    InvalidSwapPath = 4,
    InvalidSwapToken = 5,
    InsufficientTokenBalance = 6,
}
