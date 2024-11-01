import Addresses from './contract-addresses.json'
import BMR from './abis/BuyMyRoom.json'
import MyERC20 from './abis/MyERC20.json'
import Web3 from 'web3';

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const BMR_Address = Addresses.BMR
const BMR_ABI = BMR.abi
const myERC20Address = Addresses.myERC20
const myERC20ABI = MyERC20.abi

// 获取合约实例
const BMR_Contract = new web3.eth.Contract(BMR_ABI as any, BMR_Address);
const myERC20Contract = new web3.eth.Contract(myERC20ABI as any, myERC20Address);

// 导出web3实例和其它部署的合约
export {web3, BMR_Contract, myERC20Contract}