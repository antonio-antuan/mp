import {CandidateStruct, OrderStruct} from '../typechain/contracts/Orders'
import {PromiseOrValue} from "../typechain/common";
import {BigNumberish} from "ethers";
export class Order {
    position: string;
    priority: string;
    lockValueInWei: string;
    reward: string;
    details: string;
    executor: string;
    state: string;
    owner: string;
    // candidates: CandidateStruct[];

    static async create(contract: OrderStruct): Promise<Order> {
        return new Order(
            (await contract.position).toString(),
            (await contract.priority).toString(),
            (await contract.lockValueInWei).toString(),
            (await contract.reward).toString(),
            (await contract.ipfsDetails).toString(),
            (await contract.executor).toString(),
            (await contract.state).toString(),
            (await contract.owner).toString(),
            );
    }

    constructor(position: string, priority: string, lockValueInWei: string, reward: string, details: string, executor: string, state: string, owner: string) {
        this.position = position
        this.priority = priority
        this.lockValueInWei = lockValueInWei
        this.reward = reward
        this.details = details
        this.executor = executor
        this.state = state
        this.owner = owner
    }

}