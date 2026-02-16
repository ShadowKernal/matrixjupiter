import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type ContactBody = {
    name?: string;
    email?: string;
    company?: string;
    message?: string;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const escapeHtml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as ContactBody;
        const name = body.name?.trim() ?? "";
        const email = body.email?.trim() ?? "";
        const company = body.company?.trim() ?? "";
        const message = body.message?.trim() ?? "";

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || "587");
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const to = process.env.CONTACT_TO_EMAIL;
        const from = process.env.CONTACT_FROM_EMAIL;

        if (!host || !port || !user || !pass || !to || !from) {
            return NextResponse.json({ error: "Server email is not configured." }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });

        const safeName = name.replace(/[\r\n]+/g, " ");
        const safeEmail = email.replace(/[\r\n]+/g, " ");
        const safeCompany = company.replace(/[\r\n]+/g, " ");
        const safeMessage = escapeHtml(message);

        await transporter.sendMail({
            from,
            to,
            replyTo: `${safeName} <${safeEmail}>`,
            subject: `New contact form submission${safeCompany ? ` - ${safeCompany}` : ""}`,
            text: [
                `Name: ${safeName}`,
                `Email: ${safeEmail}`,
                `Company / Project: ${safeCompany || "-"}`,
                "",
                "Message:",
                message,
            ].join("\n"),
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
                <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
                <p><strong>Company / Project:</strong> ${escapeHtml(safeCompany || "-")}</p>
                <p><strong>Message:</strong></p>
                <pre style="white-space: pre-wrap; font-family: inherit;">${safeMessage}</pre>
            `,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Contact form send error", error);
        return NextResponse.json({ error: "Failed to send message. Please try again shortly." }, { status: 500 });
    }
}
