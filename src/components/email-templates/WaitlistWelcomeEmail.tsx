import {
    Hr,
    Text,
    Link,
    Html,
    Head,
    Body,
    Section,
    Preview,
    Tailwind,
    Container,
} from "@react-email/components";

export function WaitlistWelcomeEmail({ url }: { url: string }) {
    return (
        <Html>
            <Head />
            <Preview>Welcome to InterviewMaster.ai</Preview>
            <Tailwind>
                <Body className="bg-[#272727] my-auto mx-auto font-sans text-[#f9f4da]">
                    <Container className="max-w-2xl mx-auto p-8">
                        <Section className="mb-4">
                            <Text className="text-2xl font-bold mb-4">Hey there!</Text>
                            <Text className="mb-4">
                                It&apos;s Sameer, the founder of InterviewMaster.ai. Thank you for joining the waitlist.
                            </Text>
                        </Section>

                        <Section className="mb-4">
                            <Text className="mb-4">
                                Early supporters get first access to mock interviews, resume tools, and interview prep resources. We&apos;ll be in touch soon.
                            </Text>
                        </Section>

                        <Section className="mb-4">
                            <Text className="mb-4">
                                If you have questions, reply to this email or follow InterviewMaster on <Link href="https://www.linkedin.com/company/interviewmaster">LinkedIn</Link> or <Link href="https://www.x.com/interviewmaster">Twitter</Link>.
                            </Text>
                        </Section>

                        <Section className="mb-8">
                            <Text className="mb-4">Talk soon.</Text>
                        </Section>

                        <Hr className="border-[#f9f4da] my-8" />

                        <Section>
                            <Text className="mb-4">
                                Sameer<br />
                                Founder, InterviewMaster.ai
                            </Text>
                        </Section>

                        <Text className="text-center">
                            Copyright © {new Date().getFullYear()} Sameer / InterviewMaster.ai. <br />{" "}
                            <Link href={url}>All rights reserved</Link>
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
