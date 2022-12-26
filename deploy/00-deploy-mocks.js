import {
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER
} from "../helper-hardhat-config"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = getNamedAccounts
    const chainId = network.config.chainId

    if (developmentChain.includes(chainId)) {
        log("Local network detected! Deploying mocks...")

        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true
        })

        log("Mocks deployed successfully")
        log("___________________________")
    }
}
