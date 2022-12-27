require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("hardhat-deploy")
require("solidity-coverage")

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL
const COINMARKETCAP_API = process.env.COINMARKETCAP_API

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8"
            },
            {
                version: "0.6.6"
            }
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_PRIVATE_KEY],
            chainId: 5
            // blockConfirmations: 2
        },
        local: {
            url: LOCAL_RPC_URL,
            chainId: 31337
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    }
}
