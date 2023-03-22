const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe Contract", async () => {
          let fundMe
          let deployer
          let mockV3Aggregator
          // const sendValue = "100000000000000000" // = 1 ETH
          const sendValue = ethers.utils.parseEther("1") // = 1 ETH

          beforeEach(async () => {
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]

              // Because getNamedAccounts() returns a Object, so declare like this
              deployer = (await getNamedAccounts()).deployer

              // fixture: deploy anything in /deploy folder which have the tag "all"
              await deployments.fixture(["all"])

              // Get the most recent contract with the name "FundMe"
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("contructor", async () => {
              it("set the V3 Aggregator address correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async () => {
              it("fails when not funding enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "FundMe__NotSendEnoughETH"
                  )
              })

              it("updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToContribution(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("add funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from single funder", async () => {
                  // Arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Act
                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  // Used breakpoint and Ctrl Shift D to log
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("withdraw ETH from multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Act
                  const txResponse = await fundMe.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  // Used breakpoint and Ctrl Shift D to log
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure to reset the funders array
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToContribution(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("only owner can withdraw fund", async () => {
                  const attacker = (await ethers.getSigners())[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("check if is the owner", async () => {
                  assert.equal(await fundMe.getOwner(), deployer)
              })
          })
      })
