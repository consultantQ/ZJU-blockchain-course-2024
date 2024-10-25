import {Button, Card, Input, Modal, Segmented} from 'antd';
import {useEffect, useState} from 'react';
import {BMR_Contract, web3} from "../../utils/contracts";
import './index.css';
import { useImmer } from 'use-immer';
import { AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import moment from 'moment';
const { Meta } = Card;

const GanacheTestChainId = '0x539'
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

type houseType = {
    tokenId: number,
    owner: string,
    price: number,
    isListed: boolean,
    listedStartTimestamp: number
}

const BMRPage = () => {
    const [segmentedValue, setSegmentedValue] = useState('MyHouses');
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState<houseType>();
    const [inputPrice, setInputPrice] = useState(0);

    const [account, setAccount] = useState('')
    const [isInit, setIsInit] = useState(false)
    const [myHouses, updateMyHouses] = useImmer<any[]>([])
    const [listingHouses, updateListingHouses] = useImmer<any[]>([])

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getBMRContractInfo = async () => {
            if (BMR_Contract) {
                // const platformName = await BMR_Contract.methods.platform().call()
                // alert('Contract platform name: ' + platformName)
                const result = await BMR_Contract.methods.initUsers(account).call();
                setIsInit(result);
                const hs = await BMR_Contract.methods.getMyHouses().call({ from: account })
                updateMyHouses(hs)
                const lhs = await BMR_Contract.methods.getTotalListingHouses().call({ from: account })
                updateListingHouses(lhs)
            } else {
                alert('Contract not exists.')
            }
        }
        getBMRContractInfo()
    }, [account])

    const onGetInitHouse = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BMR_Contract) {
            try {
                const result = await BMR_Contract.methods.initUsers(account).call();
                setIsInit(result);
    
                if (result) {
                    alert('You have got the initial house.')
                    return
                }

                await BMR_Contract.methods.initUserHouse().send({
                    from: account
                })
                
                const hs = await BMR_Contract.methods.getMyHouses().call({
                    from: account
                })
                updateMyHouses(draft => {
                    draft.length = 0
                    draft.push(...hs)
                })
                setIsInit(true)
                alert("You have got the initial house.")
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onGetMyHouse = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BMR_Contract) {
            try {
                const hs = await BMR_Contract.methods.getMyHouses().call({
                    from: account
                })
                updateMyHouses(draft => {
                    draft.length = 0
                    draft.push(...hs)
                })
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onGetTotalListingHouses = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BMR_Contract) {
            try {
                const lhs = await BMR_Contract.methods.getTotalListingHouses().call({
                    from: account
                })
                updateListingHouses(draft => {
                    draft.length = 0
                    draft.push(...lhs)
                })
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const updateInfo = async () => {
        onGetMyHouse()
        onGetTotalListingHouses()
    }

    const onListHouse = async (tokenId:number, price: number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BMR_Contract) {
            try {
                // convert ETH to Wei
                const wei_price = web3.utils.toWei(price.toString(), 'ether')
                await BMR_Contract.methods.listHouse(tokenId, wei_price).send({
                    from: account
                })
        
                updateInfo()
                alert('You have listed the house.')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onUnListHouse = async (tokenId:number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BMR_Contract) {
            try {
                await BMR_Contract.methods.unListHouse(tokenId).send({
                    from: account
                })
                updateInfo()
                alert('You have unlisted the house.')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const showBuyModal = (house: any) => {
        setSelectedHouse(house);
        setIsBuyModalOpen(true);
    };

    const handleBuyOk = (tokenId: number, price: number) => {
        onBuyHouse(tokenId, price).then(() => {
            setIsBuyModalOpen(false);
        });
    };

    const handleBuyCancel = () => {
        setIsBuyModalOpen(false);
    };

    const showQueryModal = (house: any) => {
        setSelectedHouse(house);
        setIsQueryModalOpen(true);
    };

    const handleQueryCancel = () => {
        setIsQueryModalOpen(false);
    };

    const showListModal = (house: any) => {
        setSelectedHouse(house);
        setIsListModalOpen(true);
    };

    const handleListOk = (tokenId: number) => {
        if (inputPrice <= 0) {
            alert('Price should be greater than 0.');
            return;
        }
        onListHouse(tokenId, inputPrice).then(() => {
            setIsListModalOpen(false);
        });
    };

    const handleListCancel = () => {
        setIsListModalOpen(false);
    };

    const onBuyHouse = async (tokenId: number, price: number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        
        if (BMR_Contract) {
            try {
                await BMR_Contract.methods.buyHouse(tokenId).send({
                    from: account,
                    value: price
                })

                updateInfo()

                alert('You have bought the house.')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }
        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }
            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleChange = (value: any) => {
        setSegmentedValue(value)
        if (value === 'MyHouses') {
            onGetMyHouse()
        }
        if (value === 'Listing') {
            onGetTotalListingHouses()
        }
    }
    
    return (
        <div className='container'>
            <div className='main'>
                <div className='account'>
                    {/* <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有房屋数量：{account === '' ? 0 : myHouses.length}</div> */}
                    {account === '' && <Button onClick={onClickConnectWallet}>连接账号</Button>}
                    {isInit === false && <Button onClick={onGetInitHouse}>获得初始房屋</Button>}
                    
                    <Segmented
                        options={[
                        { label: '我的房产', value: 'MyHouses', icon: <BarsOutlined /> },
                        { label: '房产交易', value: 'Listing', icon: <AppstoreOutlined /> },
                        ]}
                        value={segmentedValue}
                        onChange={handleChange}
                    />
                    <br />
                    <br />
                    {
                        segmentedValue === 'MyHouses' && 
                        <div>
                            <div>
                                {myHouses.map((house: any, index: number) => {
                                    return <div key={index}>
                                        <Card
                                            style={{ width: 300 }}
                                            cover={
                                            <img
                                                alt="example"
                                                src={`/houses/${house.tokenId % 10}.jpg`}
                                            />
                                            }
                                            actions={[
                                            <Button className="cardButtons" key="list" onClick={() => showListModal(house)}>上架</Button>,
                                            <Button className="cardButtons" key="unlist" onClick={() => onUnListHouse(house.tokenId)}>下架</Button>,
                                            ]}
                                        >
                                            <Meta
                                            title={`房屋ID：${house.tokenId}`}
                                            description={`房屋出售情况：${house.isListed ? '已上架' : '未上架'}`}
                                            />
                                        </Card>
                                        <br />
                                    </div>
                                })}
                                <Modal title="确认上架" open={isListModalOpen} onOk={() => selectedHouse && handleListOk(selectedHouse.tokenId)} onCancel={handleListCancel} okText="确认" cancelText="取消">
                                        <label>请输入价格（ETH）：</label>
                                        <Input placeholder="请输入价格" onChange={(e) => {
                                            setInputPrice(Number(e.target.value))
                                        }} />
                                </Modal>
                            </div>
                        </div>
                    }
                    {
                        segmentedValue === 'Listing' &&
                        <div>
                            <div>
                                {listingHouses.map((house: any, index: number) => {
                                    const formattedDate = moment.unix(house.listedStartTimestamp).format('YYYY-MM-DD HH:mm:ss');            
                                    return <div key={index}>
                                        <Card
                                            style={{ width: 300 }}
                                            cover={
                                            <img
                                                alt="example"
                                                src={`/houses/${house.tokenId % 10}.jpg`}
                                            />
                                            }
                                            actions={[
                                            <Button className="cardButtons" key="list" onClick={() => showBuyModal(house)}>购买</Button>,
                                            <Button className="cardButtons" key="unlist" onClick={() => showQueryModal(house)}>查看户主</Button>,
                                            ]}
                                        >
                                            <Meta
                                            title={`房屋ID：${house.tokenId}`}
                                            description={<div>
                                                房屋价格：{web3.utils.fromWei(house.price.toString(), 'ether')} <br />
                                                挂单时间：{formattedDate }
                                            </div>}
                                            />
                                        </Card>
                                        <br />
                                    </div>
                                })}
                                <Modal title="确认购买" open={isBuyModalOpen} onOk={() => selectedHouse && handleBuyOk(selectedHouse.tokenId, selectedHouse.price)} onCancel={handleBuyCancel} okText="确认" cancelText="取消">
                                        <p>你确定花费{selectedHouse && web3.utils.fromWei((selectedHouse.price.toString()), 'ether')} ETH 购买该房产吗？</p>
                                </Modal>
                                <Modal title="查询信息" open={isQueryModalOpen} onOk={handleQueryCancel} onCancel={handleQueryCancel} okText="确认" cancelText="取消">
                                    <p>户主：{selectedHouse?.owner}</p>
                                    <p>户主出售的房产：</p>
                                    {listingHouses.map((h: any, index: number) => {
                                        if (selectedHouse?.owner === h.owner) {
                                            return <p>房屋ID： {h?.tokenId}</p>
                                        }
                                        else {
                                            return <> </>
                                        }
                                    })}
                                </Modal>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default BMRPage