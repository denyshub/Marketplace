import React, { useEffect, useState } from "react";
import GoodsList from "../../components/goods_list/goods_list";

const Sales = () => {
    return (
        <div>
            <GoodsList title="Sales" filters={{ sale_percent: true }} all='1' limit={25} pagination='1'/>
        </div>
    );
};

export default Sales;
