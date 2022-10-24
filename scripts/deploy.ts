import { ethers } from "hardhat";

async function main() {
    const mpFactory = await ethers.getContractFactory("Mp");
    const ordersFactory = await ethers.getContractFactory("Orders");
    const parti = await ethers.getContractFactory("Participants");
    const setFactory = await ethers.getContractFactory("Set");
    const comFactory = await ethers.getContractFactory("Commission");
    const repFactory = await ethers.getContractFactory("Reputation");

    const part = await parti.deploy();
    const set = await setFactory.deploy();
    const com = await comFactory.deploy()
    const rep = await repFactory.deploy()
    const orders = await ordersFactory.deploy()

    let mp = await mpFactory.deploy(part.address, set.address, com.address, rep.address, orders.address);

    console.log(`Deployed, address: ${mp.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

