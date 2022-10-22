import { ethers } from "hardhat";

async function main() {
    const mpFactory = await ethers.getContractFactory("Mp");
    const orderFactory = await ethers.getContractFactory("Order");
    const parti = await ethers.getContractFactory("Participants");
    const setFactory = await ethers.getContractFactory("Set");
    const comFactory = await ethers.getContractFactory("Commission");
    const repFactory = await ethers.getContractFactory("Reputation");

    const doers = await parti.deploy();
    const set = await setFactory.deploy();
    const com = await comFactory.deploy()
    const rep = await repFactory.deploy()
    await mpFactory.deploy(doers.address, set.address, com.address, rep.address);

    console.log(`Deployed`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

