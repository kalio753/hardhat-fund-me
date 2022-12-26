// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Fundme {
    using PriceConverter for uint256;

    uint256 minUsd = 10 * 1e18;
    address[] public funders;
    mapping(address => uint256) public funderToContribution;
    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.ethToUsd(priceFeed) >= minUsd,
            "Didn't send enough at least 50$"
        );
        funders.push(msg.sender);
        if (funderToContribution[msg.sender] != 0) {
            funderToContribution[msg.sender] += msg.value;
        } else {
            funderToContribution[msg.sender] = msg.value;
        }
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            funderToContribution[funder] = 0;
        }

        // Reset array
        funders = new address[](0);

        // 3 ways to send ETH:

        // Transfer - cost 2300 gas, throws err
        // payable(msg.sender).transfer(address(this).balance);

        // Send - cost 2300 gas, return boolean
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Fail to withdraw the balance !");

        // Call - most common way
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Fail to withdraw the balance !");
    }

    modifier onlyOwner() {
        require(
            msg.sender == i_owner,
            "You don't have permission to withdraw the fund !"
        );
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
