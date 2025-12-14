import { RouteObject } from "react-router-dom";
import App from "../App";
import PoolPage from "@/pools/Pools";
import CreatePoolPage from "@/pools/createPool/CreatePool";
import AddLiquidityPage from "@/pools/addLiquidity/AddLiquidity";
import WithdrawLiquidityPage from "@/pools/withdrawLiquidity/WithdrawLiquidity";
import ExplorePage from "@/explore/Explore";
import PoolDetails from "@/poolDetails/PoolDetails";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />, 
  },
  {
    path: "/pool",
    element: <PoolPage />, 
  },{
    path: "/pool/initialize",
    element: <CreatePoolPage />, 
  },{
    path: "/pool/add",
    element: <AddLiquidityPage />, 
  },{
    path: "/pool/withdraw",
    element: <WithdrawLiquidityPage />, 
  },{
    path: "/explore",
    element: <ExplorePage />, 
  },{
    path: "/explore/:poolId",
    element: <PoolDetails />, 
  },
];
export default routes;
