/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IParticipants,
  IParticipantsInterface,
} from "../../contracts/IParticipants";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    name: "changeDoerSuccessRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_doer",
        type: "address",
      },
    ],
    name: "doerIsValid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_doer",
        type: "address",
      },
    ],
    name: "newDoer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IParticipants__factory {
  static readonly abi = _abi;
  static createInterface(): IParticipantsInterface {
    return new utils.Interface(_abi) as IParticipantsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IParticipants {
    return new Contract(address, _abi, signerOrProvider) as IParticipants;
  }
}
