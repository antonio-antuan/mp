import {ethers} from 'ethers'
import {Mp, Mp__factory} from "../typechain"
import {Order} from '../models/Order'

let provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const marketplaceContractAddress = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'

const marketplace = Mp__factory.connect(marketplaceContractAddress, provider.getSigner())

class Service {
    mp: Mp
    constructor(mp: Mp) {
        this.mp = mp
    }

    public async createOrder(): Promise<void> {
        await this.mp.createOrder(1000, "foofoo", {
            value: 1000,
        })
    }

    public async getPendingOrdersBatch(limit:number, offset:number): Promise<Order[]> {
        const indices = await this.mp.getPendingOrdersBatch(limit, offset)
        return (await Promise.all(indices.map(async i => {
            let oo = await this.mp.callStatic.getOrder(i)
            return await Order.create(oo)
        })))
    }
}

export default new Service(marketplace)