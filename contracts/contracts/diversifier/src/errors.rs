use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 201,
    NotActive = 202,
    NotAllowed = 203,
    InvalidSwapPath = 204,
    InvalidSwapToken = 205,
    InsufficientTokenBalance = 206,
}
