<script setup lang="ts">
// import { getAuth, signOut } from "firebase/auth";

// import Logo from '@/assets/img/logo-yacco.png'

// const auth = getAuth();
// const router = useRouter();

// const loading = ref(false);

// const user = await getCurrentUser();

// const handleLogout = () => {
//   Modal.confirm({
//     title: "Salir?",
//     onOk: () => {
//       signOut(auth)
//         .then(() => {
//           router.go(0);
//         })
//         .catch((_error) => {
//           // An error happened.
//         });
//     },
//   });
// };

// const handleFinish = async () => {
//   const { handlePrintCustomersSale: handlePrintCustomersSaleExcel } = useVoucherExcel()

//   const {
//     updateTemp: updateTempCustomer,
//     updateTotalSale: updateTotalSaleCustomer,
//     updateTotalDebt: updateTotalDebtCustomer,
//     updateLastSale: updateLastSaleCustomer,
//   } = useCrudCustomers()

//   const { updateTemp: updateTempProduct } = useCrudProducts()
//   const { updateTemp: updateTempMovement } = useCrudMovements()
//   const { updateTemp: updateTempCM } = useCrudCashMovements()
//   const { updateTemp: updateTempDebtPayment } = useCrudDebts()
//   const { updateTemp: updateTempVoucher } = useCrudVouchers()
//   const { updateTemp: updateTempPaymentReason } = useCrudPaymentReasons()
//   const { updateTemp: updateTempDistribution } = useCrudDistributions()

//   try {
//     loading.value = true
//     // await updateTotalDebtCustomer()
//     // await updateTempVoucher()
//   } catch (error: any) {
//     console.log(error.message)
//   } finally {
//     loading.value = false
//   }
// }
</script>

<template>
  <a-layout-sider
    breakpoint="lg"
    collapsed-width="0"
    class="lg:sticky fixed top-0 bottom-0 left-0 h-screen z-10 lg:overflow-auto"
  >
    <div class="flex flex-col justify-between h-full pb-6">
      <div>
        <div class="h-[40px] m-2 py-1 flex flex-col justify-center text-center">
          <div>
            <h1 class="m-0 text-xl text-white">
              Steel <sup class="text-xs">App</sup>
            </h1>
          </div>
        </div>

        <!-- <a-button type="primary" danger :loading="loading">Temps</a-button> -->

        <MenuNav />
      </div>

      <div class="py-5"></div>

      <div class="text-center">
        <!-- <span class="text-white"> {{ user && user.email }}</span> -->
        <br />
        <a-button type="link" danger> Cerrar sesión </a-button>
      </div>
    </div>
  </a-layout-sider>
</template>
