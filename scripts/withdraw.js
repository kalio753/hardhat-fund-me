const { getNamedAccounts, ethers } = require("hardhat")

const main = async () => {
    const { deployer } = getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Withdrawing contract ...")
    const txResponse = await fundMe.withdraw()
    const txReceipt = await txResponse.wait(1)
    console.log("Withdrawed !")
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
