// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // );

        (
            ,
            /*uint80 roundID*/ int price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = priceFeed.latestRoundData();
        return uint256(price * 1e10); // Bc this already having default as 8 decimal places compare to 18 decimal places as msg.value
    }

    function ethToUsd(
        uint256 _amount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);

        //    1    ETH : 1100 USDT
        // _amount ETH :   ?  USDT
        // Notice: In Solidity, unit of msg.value is Wei, which mean equals to 1 ETH = 1e18 Wei
        //         that's why we should divide it by 1e18
        return (_amount * ethPrice) / 1e18;
    }
}
