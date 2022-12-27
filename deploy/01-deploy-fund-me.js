const { network } = require("hardhat")

const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

// destructuring from hre (hardhat runtimes environment)
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // To run on localhost or hardhat server, we need to use mock
    // If doesn't exist, we deploy minimal version mock for local testing

    const args = [ethUsdPriceFeedAddress]
    log("Before deploy FundMe")
    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("FundMe deployed successfully")

    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("___________________________")
}

module.exports.tags = ["all", "fundme"]
