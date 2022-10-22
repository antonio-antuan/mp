import {OrderStruct} from '../typechain/contracts/Orders'
export class Order {
    order: OrderStruct

    constructor(contract:OrderStruct) {
        this.order = contract
    }
}