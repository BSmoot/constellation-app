// src/app/test-db/layout.tsx
export default function TestDBLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {children}
        </div>
    );
}