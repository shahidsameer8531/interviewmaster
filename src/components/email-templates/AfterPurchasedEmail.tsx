import {
    Hr,
    Img,
    Row,
    Head,
    Body,
    Html,
    Link,
    Text,
    Column,
    Preview,
    Section,
    Tailwind,
    Container,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.HOSTING_URL
    ? process.env.HOSTING_URL
    : `http://localhost:3000`;

interface AfterPurchasedEmailProps {
    email: string;
    stripeId: string;
    totalPrice: number;
    dateOfPurchased: string;
    kit: "Starter Kit" | "Premium Kit";
}

export const AfterPurchasedEmail = ({
    kit,
    email,
    stripeId,
    totalPrice,
    dateOfPurchased,
}: AfterPurchasedEmailProps) => {
    const imgSrc = kit === "Starter Kit" ? `${baseUrl}/starter-kit-logo.png` : `${baseUrl}/premium-kit-logo.png`;
    const planName = kit === "Starter Kit" ? "Basic Prep" : "Pro Interview";
    return (
        <Html>
            <Head />
            <Preview>Your {planName} plan is ready</Preview>
            <Tailwind>
                <Body className="font-sans bg-[#272727] text-[#f9f4da] p-8">
                    <Container className="mx-auto py-5 pb-12 w-[660px] max-w-full">
                        <Section>
                            <Row>
                                <Column align="left">
                                    <Img
                                        src={`${baseUrl}/logo.png`}
                                        width="42"
                                        height="42"
                                        alt="InterviewMaster.ai"
                                    />
                                </Column>
                            </Row>
                        </Section>

                        <Section className="mb-4">
                            <Text className="text-2xl font-bold mb-4">Hey there!</Text>
                            <Text className="mb-4">
                                It&apos;s Sameer, the founder of <Link target="_blank" className="text-[#fcba28] font-bold underline m-0 p-0 leading-normal" href="https://www.interviewmaster.ai">InterviewMaster.ai</Link>. Thank you for purchasing {planName}.
                            </Text>
                        </Section>
                        <Section className="mb-4">
                            <Text className="mb-4">
                                Questions? Reach us at <Link href="mailto:support@interviewmaster.ai">support@interviewmaster.ai</Link>.
                            </Text>
                        </Section>

                        <Section className="border-collapse bg-[#171717] rounded-md text-xs">
                            <Row className="h-[46px]">
                                <Column colSpan={2}>
                                    <Section>
                                        <Row>
                                            <Column className="pl-5 border-solid border-[#f9f4da]/50 border-r border-b h-11">
                                                <Text className="text-[#f9f4da] text-[10px] m-0 p-0 leading-normal">EMAIL</Text>
                                                <Link className="text-[#fcba28] underline text-xs m-0 p-0 leading-normal">
                                                    {email}
                                                </Link>
                                            </Column>
                                        </Row>

                                        <Row>
                                            <Column className="pl-5 border-solid border-[#f9f4da]/50 border-r border-b h-11">
                                                <Text className="text-[#f9f4da] text-[10px] m-0 p-0 leading-normal">DATE OF PURCHASE</Text>
                                                <Text className="text-xs m-0 p-0 leading-normal">{dateOfPurchased}</Text>
                                            </Column>
                                        </Row>

                                        <Row>
                                            <Column className="pl-5 border-solid border-[#f9f4da]/50 border-r border-b h-11">
                                                <Text className="text-[#f9f4da] text-[10px] m-0 p-0 leading-normal">ORDER ID</Text>
                                                <Link className="text-[#fcba28] underline text-xs m-0 p-0 leading-normal">
                                                    {stripeId}
                                                </Link>
                                            </Column>
                                        </Row>
                                    </Section>
                                </Column>
                            </Row>
                        </Section>

                        <Section className="border-collapse bg-[#171717] rounded-md text-xs mt-8 mb-4 h-6">
                            <Text className="bg-[#f9f4da] text-[#272727] pl-2.5 text-sm font-bold m-0">InterviewMaster.ai {planName}</Text>
                        </Section>

                        <Section>
                            <Row>
                                <Column className="w-16">
                                    <Img
                                        src={imgSrc}
                                        width="72"
                                        height="72"
                                        alt="Plan"
                                        className="ml-5 rounded-[14px] border border-[#f9f4da]/50"
                                    />
                                </Column>
                                <Column className="pl-[22px] max-w-[400px]">
                                    <Text className="text-sm font-semibold m-0 p-0 leading-normal mb-2">{planName}</Text>
                                    {kit === "Starter Kit" ? (
                                        <Text className="text-xs text-[#f9f4da]/80 m-0 p-0 leading-relaxed">
                                            AI mock interview questions, interview simulator access, resume templates, and email support.
                                        </Text>
                                    ) : (
                                        <Text className="text-xs text-[#f9f4da]/80 m-0 p-0 leading-relaxed">
                                            Unlimited AI mock interviews, real-time feedback, ATS resume tools, company-specific prep, and priority support.
                                        </Text>
                                    )}
                                </Column>
                                <Column className="table-cell pl-4 w-[100px] align-top" align="right">
                                    <Text className="text-sm font-semibold m-0 text-[#f9f4da]">${totalPrice}</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr className="mt-8" />

                        <Section align="right">
                            <Row>
                                <Column className="table-cell" align="right">
                                    <Text className="m-0 text-[#f9f4da] text-[10px] font-semibold pr-8 text-right">TOTAL</Text>
                                </Column>
                                <Column className="h-12 border-l border-[#f9f4da]/50"></Column>
                                <Column className="table-cell w-[90px]">
                                    <Text className="mx-0 mr-5 text-base font-semibold whitespace-nowrap text-right text-[#f9f4da]">${totalPrice}</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr className="mb-[30px]" />

                        <Section>
                            <Row>
                                <Column align="center" className="block mt-4">
                                    <Text className="text-xl font-medium text-[#f9f4da]">Good luck with your interviews.</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr className="my-16" />

                        <Section>
                            <Row>
                                <Column align="center" className="block mt-4">
                                    <Img
                                        src={`${baseUrl}/logo.png`}
                                        width="40"
                                        height="40"
                                        alt="InterviewMaster.ai"
                                    />
                                </Column>
                            </Row>
                        </Section>

                        <Text className="mt-2 text-center text-xs text-[#f9f4da]/50">
                            <Link href="https://www.interviewmaster.ai/" className="text-[#fcba28] underline">
                                Home
                            </Link>
                        </Text>

                        <Text className="mt-6 text-center text-xs text-[#f9f4da]/80">
                            © Sameer / InterviewMaster.ai {new Date().getFullYear()}<br />{" "}
                            All Rights Reserved
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
};
