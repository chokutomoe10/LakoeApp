import {
  Box,
  Button,
  Card,
  Flex,
  Img,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { loader } from "~/routes/order";
import ModalTracking from "./orderTrackingModal";
import { db } from "~/libs/prisma/db.server";

export function formatCurrency(price: number): string {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return formattedAmount;
}

export default function CardReadyToShip() {
  //import loader
  const cardProduct = useLoaderData<typeof loader>();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [cardModals, setCardModals] = useState<{ [key: string]: boolean }>({});
  const [disabledButtons, setDisabledButtons] = useState<string[]>([]);

  const currentTime = cardProduct.currentTime;

  function openModal(trackingId: string, id: string) {
    // Check if the modal for this card is already open
    if (cardModals[id]) {
      return;
    }

    // Set the modal state for this card to open
    const updatedCardModals = { ...cardModals };
    updatedCardModals[id] = true;
    setCardModals(updatedCardModals);

    setSelectedCardId(trackingId);
    setModalIsOpen(true);
  }

  function closeModal(id: string) {
    // Set the modal state for this card to closed
    const updatedCardModals = { ...cardModals };
    updatedCardModals[id] = false;
    setCardModals(updatedCardModals);

    setModalIsOpen(false);
  }

  return (
    <>
      {/* CARD START HERE */}

      {cardProduct.dataProductReadyToShip.reverse().map((data) => (
        <Card mb={5} boxShadow={"xs"} key={data.id}>
          <Box key={data.id}>
            <Box mt={5}>
              <Box>
                <Flex justifyContent={"space-between"} px={2}>
                  <Button
                    bg={"#147AF3"}
                    color={"white"}
                    fontWeight={"bold"}
                    colorScheme="gray.600"
                    size={"sm"}
                    pointerEvents={"none"}
                  >
                    {data.status === "READY_TO_SHIP" ? "Siap Dikirim" : ""}
                  </Button>
                  <Form
                    method="POST"
                    onSubmit={() => {
                      openModal(data.courier?.trackingId as string, data.id);
                    }}
                  >
                    <Input
                      name="actionType"
                      value={"createTrackingLimit"}
                      hidden
                    />
                    <Input name="invoiceId" value={data.id} hidden />
                    <Button
                      bg={"transparent"}
                      border={"1px solid #D5D5D5"}
                      borderRadius={"full"}
                      fontSize={"14px"}
                      isDisabled={
                        // Your condition for disabling the button
                        currentTime / 1000 <
                        new Date(
                          data.biteshipTrackinglimits?.nextAccessTime ?? ""
                        ).getTime() /
                          1000
                        // showModalForCardId === data.id
                      }
                      type="submit"
                    >
                      Tracking Pengiriman
                    </Button>
                  </Form>
                </Flex>
                <Text my={1} fontSize={"14px"} color={"gray.400"} px={2}>
                  {data.invoiceNumber}
                </Text>
                <hr />
                <Link to={"detail/" + data.id}>
                  <Flex justifyContent={"space-between"}>
                    <Box display={"flex"} gap={3} w={"80%"}>
                      {data.cart?.cartItems.map((item, index) => (
                        <Img
                          key={index}
                          w={"52px"}
                          h={"52px"}
                          display={"inline"}
                          borderRadius={"md"}
                          src={item.product?.attachments[0]?.url}
                          mt={3}
                        />
                      ))}
                      <Text
                        mt={4}
                        id="fm500"
                        fontSize={"16px"}
                        textOverflow={"ellipsis"}
                        overflow={"hidden"}
                        whiteSpace={"nowrap"}
                        fontWeight={"700"}
                      >
                        {data.cart?.cartItems.map((item) => item.product?.name)}
                        <Text color={"gray.400"} pb={3} fontWeight={"normal"}>
                          {data.cart?.cartItems.map((item) => item.qty)} Barang
                        </Text>
                      </Text>
                    </Box>
                    <Box mt={4} w={"15%"}>
                      <Flex gap={1}>
                        <Text color={"#909090"} fontSize={"14px"}>
                          Total
                        </Text>
                        <Text color={"#909090"} fontSize={"14px"}>
                          Belanja
                        </Text>
                      </Flex>
                      <Text fontWeight={"bold"} fontSize={"14px"}>
                        {formatCurrency(data.price)}
                      </Text>
                    </Box>
                  </Flex>
                </Link>
              </Box>
            </Box>
          </Box>
        </Card>
      ))}

      {modalIsOpen && (
        <ModalTracking
          isOpen={modalIsOpen}
          onClose={() => closeModal(selectedCardId)}
          selectedCardId={selectedCardId}
        />
      )}

      {/* END CARD */}
    </>
  );
}
