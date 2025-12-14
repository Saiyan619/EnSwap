import BackgroundGlow from "@/global/BackgroundGlow"
import Navbar from "@/global/Navbar"
import { useGetSinglePool } from "@/program-hooks/getPools";
import { useParams } from "react-router-dom"

const PoolDetails = () => {
    const {poolId} = useParams();
    console.log(poolId)
    const {data} = useGetSinglePool(poolId);
    console.log(data)
  return (
    <main className="relative min-h-screen">
      <BackgroundGlow />
      <Navbar />

      <div>

      </div>
</main>
  )
}

export default PoolDetails
