import React, {useEffect} from 'react';
import axios from "axios";
const fetch = require('isomorphic-fetch')
const { providers, BigNumber, Wallet } = require('ethers')
const { formatUnits, parseUnits } = require('ethers/lib/utils')

const API_URL = "https://api.1inch.io/v5.0";

const rpcUrls = {
  ethereum: 'https://mainnet.infura.io',
  polygon: 'https://polygon.infura.io',
  xdai: 'https://xdai.infura.io'
}

const slugToChainId = {
  ethereum: 1,
  polygon: 137,
  xdai: 100
}

const tokenDecimals = {
  USDC: 6,
  ETH: 18
}

const addresses = {
  ethereum: {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    ETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    ETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
  },
  xdai: {
    USDC: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    ETH: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'
  }
}

const getQuoteOne = async (fromTokenAddress, toTokenAddress) => {
  if (!slugToChainId['ethereum']) {
    throw new Error('chainId is required')
  }
  if (!fromTokenAddress) {
    throw new Error('fromTokenAddrss is required')
  }
  if (!toTokenAddress) {
    throw new Error('toTokenAddress is required')
  }

  const url = `https://rest.coinapi.io/v1/exchangerate/${toTokenAddress}/${fromTokenAddress}`

  const res = await axios.get(url, {
    headers: {
      'X-CoinAPI-Key': '4B5DB34B-2921-4739-ADF8-C91092A25A4C'
    }
  });
  
  return res.data.rate
};


const getQuote = async (fromTokenAddress, toTokenAddress, amount) => {
    if (!slugToChainId['ethereum']) {
      throw new Error('chainId is required')
    }
    if (!fromTokenAddress) {
      throw new Error('fromTokenAddrss is required')
    }
    if (!toTokenAddress) {
      throw new Error('toTokenAddress is required')
    }
    if (!amount) {
      throw new Error('amount is required')
    }
    const url = `${API_URL}/${slugToChainId['ethereum']}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`
    const result = await getJson(url)
    if (!result.toTokenAmount) {
      console.log(result)
      throw new Error('expected tx data')
    }

    const { toTokenAmount } = result

    return toTokenAmount
};

const getQuoteGasFee = async (fromTokenAddress, toTokenAddress, amount) => {
  if (!slugToChainId['ethereum']) {
    throw new Error('chainId is required')
  }
  if (!fromTokenAddress) {
    throw new Error('fromTokenAddrss is required')
  }
  if (!toTokenAddress) {
    throw new Error('toTokenAddress is required')
  }
  if (!amount) {
    throw new Error('amount is required')
  }
  const url = `${API_URL}/${slugToChainId['ethereum']}/quote?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}`
  const result = await getJson(url)
  if (!result.toTokenAmount) {
    console.log(result)
    throw new Error('expected tx data')
  }

  const { estimatedGas } = result

  return estimatedGas
};

const getAllowance = async (tokenAddress, walletAddress) => {
    if (!slugToChainId['ethereum']) {
      throw new Error('chainId is required')
    }
    if (!tokenAddress) {
      throw new Error('tokenAddress required')
    }
    if (!walletAddress) {
      throw new Error('walletAddress is required')
    }

    const url = `${API_URL}/${slugToChainId['ethereum']}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress}`
    const result = await getJson(url)
    if (result.allowance === undefined) {
      console.log(result)
      throw new Error('expected tx data')
    }

    return result.allowance
};

const getApproveTx = async (tokenAddress, amount) => {
    if (!slugToChainId['ethereum']) {
      throw new Error('chainId is required')
    }
    if (!tokenAddress) {
      throw new Error('tokenAddress required')
    }
    if (!amount) {
      throw new Error('amount is required')
    }

    const url = `${API_URL}/${slugToChainId['ethereum']}/approve/transaction?&amount=${amount}&tokenAddress=${tokenAddress}`
    const result = await getJson(url)
    if (!result.data) {
      console.log(result)
      throw new Error('expected tx data')
    }

    const { data, to, value } = result

    return {
      data,
      to,
      value
    }
};

const getSwapTx = async (fromTokenAddress, toTokenAddress, fromAddress, amount, slippage) => {
    if (!slugToChainId['ethereum']) {
      throw new Error('chainId is required')
    }
    if (!fromTokenAddress) {
      throw new Error('fromTokenAddrss is required')
    }
    if (!toTokenAddress) {
      throw new Error('toTokenAddress is required')
    }
    if (!fromAddress) {
      throw new Error('fromAddress is required')
    }
    if (!amount) {
      throw new Error('amount is required')
    }
    if (!slippage) {
      throw new Error('slippage is required')
    }
    const url = `${API_URL}/${slugToChainId['ethereum']}/swap?fromTokenAddress=${fromTokenAddress}&toTokenAddress=${toTokenAddress}&amount=${amount}&fromAddress=${fromAddress}&slippage=${slippage}`
    const result = await getJson(url)
    if (!result.tx) {
      // console.log(result)
      throw new Error('expected tx data')
    }

    const { data, to, value } = result.tx

    return {
      data,
      to,
      value
    }
};

const getJson = async (url) => {
    const res = await fetch(url)
    const json = await res.json()
    if (!json) {
      throw new Error('no response')
    }
    if (json.error) {
      console.log(json)
      throw new Error(json.description || json.error)
    }

    return json
};

const SwapService = {
    getQuote,
    getAllowance,
    getApproveTx,
    getSwapTx,
    getQuoteGasFee,
    getQuoteOne
}
export default SwapService;