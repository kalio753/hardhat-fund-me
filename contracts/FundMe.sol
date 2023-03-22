// SPDX-License-Identifier: MIT

// Pragma
pragma solidity ^0.8.0;

// Import
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

// Errors
error FundMe__NotOwner();
error FundMe__NotSendEnoughETH();
error FundMe__WithdrawFail();

/** @title A contract for crowd funding
 *  @author Chris Lin
 *  @notice This contract is to demo a simple funding contract
 *  @dev This implements price feed as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State variables
    address[] private s_funders;
    mapping(address => uint256) private s_funderToContribution;
    address private immutable i_owner;
    uint256 constant MIN_USD = 10 * 1e18;
    AggregatorV3Interface private s_priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        // require(
        //     msg.sender == i_owner,
        //     "You don't have permission to withdraw the fund !"
        // );
        _;
    }

    // Functions:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);

        // Because the default use of the priceFeed is like so to get
        // price feed from chain:
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // );
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    function fund() public payable {
        if (msg.value.ethToUsd(s_priceFeed) < MIN_USD)
            revert FundMe__NotSendEnoughETH();
        // require(
        //     msg.value.ethToUsd(s_priceFeed) >= MIN_USD,
        //     "Didn't send enough at least 10$"
        // );
        s_funderToContribution[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_funderToContribution[funder] = 0;
        }

        // Reset array
        s_funders = new address[](0);

        // 3 ways to send ETH:

        // Transfer - cost 2300 gas, throws err
        // payable(msg.sender).transfer(address(this).balance);

        // Send - cost 2300 gas, return boolean
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Fail to withdraw the balance !");

        // Call - most common way
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        // require(callSuccess, "Fail to withdraw the balance !");
        if (!callSuccess) revert FundMe__WithdrawFail();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 _index) public view returns (address) {
        return s_funders[_index];
    }

    function getAddressToContribution(
        address _address
    ) public view returns (uint256) {
        return s_funderToContribution[_address];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
