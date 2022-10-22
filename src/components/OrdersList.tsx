import Marketplace from '../services/marketplace'
import React, {useEffect, useState} from "react";
import {Order} from "../models/Order";

export function OrdersList() {

    let initialOrders: Order[] = [];
    const [orders, setOrders] = useState(initialOrders);
    useEffect(() => {
        Marketplace.getPendingOrdersBatch(10, 0).then((orders) => setOrders(orders))
    })
    return (
        <div>
            {orders.map((order) => (
                <span>{order.order.reward.toString()}</span>
            ))}
        </div>
    );
}

export function CreateOrder() {
    const onClick = () => {
        Marketplace.createOrder()
    }
    return (
        <button onClick={onClick}>Create order</button>
    )
}