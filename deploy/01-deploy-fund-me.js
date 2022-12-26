const { network } = require("hardhat")

const { networkConfig } = require("../helper-hardhat-config")

// destructuring from hre (hardhat runtimes environment)
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = getNamedAccounts
    const chainId = network.config.chainId

    const ethUsdPriceFeedAddress = networkConfig.chainId.ethUsdPriceFeed

    // To run on localhost or hardhat server, we need to use mock
    // If doesn't exist, we deploy minimal version mock for local testing

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [],
        log: true
    })
}
