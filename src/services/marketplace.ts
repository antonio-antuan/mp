import {ethers} from 'ethers'
import {Mp, Mp__factory} from "../typechain"
import {Order} from '../models/Order'

let provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const marketplaceContractAddress = '0x67d269191c92caf3cd7723f116c85e6e9bf55933'

const marketplace = Mp__factory.connect(marketplaceContractAddress, provider)

class Service {
    mp: Mp
    constructor(mp: Mp) {
        this.mp = mp
    }

    public async createOrder(): Promise<void> {
        await this.mp.createOrder(0.001, "foofoo")
    }

    public async getPendingOrdersBatch(limit:number, offset:number): Promise<Order[]> {
        const indices = await this.mp.getPendingOrdersBatch(limit, offset)
        return (await Promise.all(indices.map(async i => {
            let oo = await this.mp.callStatic.getOrder(i)
            return new Order(oo)
        })))
    }
}

export default new Service(marketplace)