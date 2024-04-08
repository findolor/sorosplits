use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    NotAllowed = 2,
    InvalidSwapPath = 3,
    InvalidSwapToken = 4,
    InsufficientTokenBalance = 5,
}
