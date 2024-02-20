use soroban_sdk::{testutils::Address as _, token, vec, Address, Env, Vec};
use token::{Client as TokenClient, StellarAssetClient as TokenAdminClient};

use crate::{
    contract::{Splitter, SplitterClient},
    storage::ShareDataKey,
};

pub fn create_splitter(e: &Env) -> (SplitterClient, Address) {
    let contract_id = &e.register_contract(None, Splitter);
    (SplitterClient::new(&e, contract_id), contract_id.clone())
}

pub fn create_splitter_with_shares<'a>(
    e: &'a Env,
    admin: &Address,
    shares: &Vec<ShareDataKey>,
    mutable: &bool,
) -> (SplitterClient<'a>, Address) {
    let (client, contract_id) = create_splitter(e);
    client.init(admin, shares, mutable);
    (client, contract_id)
}

pub fn create_splitter_with_default_shares<'a>(
    e: &'a Env,
    admin: &Address,
) -> (SplitterClient<'a>, Address) {
    let (client, contract_id) = create_splitter_with_shares(
        e,
        admin,
        &vec![
            &e,
            ShareDataKey {
                shareholder: Address::generate(&e),
                share: 8050,
            },
            ShareDataKey {
                shareholder: Address::generate(&e),
                share: 1950,
            },
        ],
        &true,
    );
    (client, contract_id)
}

pub fn create_token<'a>(
    e: &Env,
    admin: &Address,
) -> (TokenClient<'a>, TokenAdminClient<'a>, Address) {
    let contract_id = e.register_stellar_asset_contract(admin.clone());
    (
        TokenClient::new(e, &contract_id),
        TokenAdminClient::new(e, &contract_id),
        contract_id,
    )
}

pub fn get_default_share_data(env: &Env) -> Vec<ShareDataKey> {
    vec![
        env,
        ShareDataKey {
            shareholder: Address::generate(env),
            share: 8050,
        },
        ShareDataKey {
            shareholder: Address::generate(env),
            share: 1950,
        },
    ]
}
