/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export type CandidateStruct = {
  addr: PromiseOrValue<string>;
  notRejected: PromiseOrValue<boolean>;
  lockedValueInWei: PromiseOrValue<BigNumberish>;
};

export type CandidateStructOutput = [string, boolean, BigNumber] & {
  addr: string;
  notRejected: boolean;
  lockedValueInWei: BigNumber;
};

export type OrderStruct = {
  position: PromiseOrValue<BigNumberish>;
  priority: PromiseOrValue<BigNumberish>;
  lockValueInWei: PromiseOrValue<BigNumberish>;
  reward: PromiseOrValue<BigNumberish>;
  ipfsDetails: PromiseOrValue<string>;
  executor: PromiseOrValue<string>;
  state: PromiseOrValue<BigNumberish>;
  owner: PromiseOrValue<string>;
  candidates: CandidateStruct[];
};

export type OrderStructOutput = [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  string,
  string,
  number,
  string,
  CandidateStructOutput[]
] & {
  position: BigNumber;
  priority: BigNumber;
  lockValueInWei: BigNumber;
  reward: BigNumber;
  ipfsDetails: string;
  executor: string;
  state: number;
  owner: string;
  candidates: CandidateStructOutput[];
};

export interface IOrdersInterface extends utils.Interface {
  functions: {
    "approveByExecutor(uint256)": FunctionFragment;
    "becomeCandidate(uint256,address)": FunctionFragment;
    "cancel(uint256)": FunctionFragment;
    "cancelBeingCandidate(uint256,address)": FunctionFragment;
    "cancelByExecutor(uint256)": FunctionFragment;
    "chooseCandidate(uint256,address)": FunctionFragment;
    "count()": FunctionFragment;
    "createOrder(address,uint256,uint256,string)": FunctionFragment;
    "getOrder(uint256)": FunctionFragment;
    "increasePriority(uint256)": FunctionFragment;
    "markAsCompleted(uint256)": FunctionFragment;
    "markAsFailed(uint256)": FunctionFragment;
    "markAsReady(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "approveByExecutor"
      | "becomeCandidate"
      | "cancel"
      | "cancelBeingCandidate"
      | "cancelByExecutor"
      | "chooseCandidate"
      | "count"
      | "createOrder"
      | "getOrder"
      | "increasePriority"
      | "markAsCompleted"
      | "markAsFailed"
      | "markAsReady"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "approveByExecutor",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "becomeCandidate",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cancel",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "cancelBeingCandidate",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cancelByExecutor",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "chooseCandidate",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "count", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "createOrder",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getOrder",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "increasePriority",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "markAsCompleted",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "markAsFailed",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "markAsReady",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "approveByExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "becomeCandidate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "cancel", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "cancelBeingCandidate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cancelByExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "chooseCandidate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "count", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOrder", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "increasePriority",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "markAsCompleted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "markAsFailed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "markAsReady",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IOrders extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IOrdersInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    approveByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    becomeCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cancel(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cancelBeingCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cancelByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    chooseCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _addr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    count(overrides?: CallOverrides): Promise<[BigNumber]>;

    createOrder(
      _owner: PromiseOrValue<string>,
      _reward: PromiseOrValue<BigNumberish>,
      _minLockValueInWei: PromiseOrValue<BigNumberish>,
      _ipfsDetails: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getOrder(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[OrderStructOutput]>;

    increasePriority(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    markAsCompleted(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    markAsFailed(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    markAsReady(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  approveByExecutor(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  becomeCandidate(
    idx: PromiseOrValue<BigNumberish>,
    _cand: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cancel(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cancelBeingCandidate(
    idx: PromiseOrValue<BigNumberish>,
    _cand: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cancelByExecutor(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  chooseCandidate(
    idx: PromiseOrValue<BigNumberish>,
    _addr: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  count(overrides?: CallOverrides): Promise<BigNumber>;

  createOrder(
    _owner: PromiseOrValue<string>,
    _reward: PromiseOrValue<BigNumberish>,
    _minLockValueInWei: PromiseOrValue<BigNumberish>,
    _ipfsDetails: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getOrder(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<OrderStructOutput>;

  increasePriority(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  markAsCompleted(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  markAsFailed(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  markAsReady(
    idx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    approveByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    becomeCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    cancel(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    cancelBeingCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    cancelByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    chooseCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    count(overrides?: CallOverrides): Promise<BigNumber>;

    createOrder(
      _owner: PromiseOrValue<string>,
      _reward: PromiseOrValue<BigNumberish>,
      _minLockValueInWei: PromiseOrValue<BigNumberish>,
      _ipfsDetails: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [OrderStructOutput, BigNumber] & { o: OrderStructOutput; num: BigNumber }
    >;

    getOrder(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<OrderStructOutput>;

    increasePriority(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    markAsCompleted(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    markAsFailed(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    markAsReady(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    approveByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    becomeCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cancel(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cancelBeingCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cancelByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    chooseCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _addr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    count(overrides?: CallOverrides): Promise<BigNumber>;

    createOrder(
      _owner: PromiseOrValue<string>,
      _reward: PromiseOrValue<BigNumberish>,
      _minLockValueInWei: PromiseOrValue<BigNumberish>,
      _ipfsDetails: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getOrder(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    increasePriority(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    markAsCompleted(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    markAsFailed(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    markAsReady(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    approveByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    becomeCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cancel(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cancelBeingCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _cand: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cancelByExecutor(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    chooseCandidate(
      idx: PromiseOrValue<BigNumberish>,
      _addr: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    count(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    createOrder(
      _owner: PromiseOrValue<string>,
      _reward: PromiseOrValue<BigNumberish>,
      _minLockValueInWei: PromiseOrValue<BigNumberish>,
      _ipfsDetails: PromiseOrValue<string>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getOrder(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    increasePriority(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    markAsCompleted(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    markAsFailed(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    markAsReady(
      idx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
