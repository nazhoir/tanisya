"use state";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@tanisya/ui/components/input-group";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";

export function InputPassword({
	id,
	name,
	value,
	placeholder,
	onFocus,
	onBlur,
	onChange,
	icon: Icon,
	"aria-invalid": ariaInvalid,
}: {
	id: string;
	name: string;
	value: string;
	placeholder?: string;
	onFocus?: () => void;
	onBlur: () => void;
	onChange: (v: string) => void;
	icon: React.ElementType;
	"aria-invalid"?: boolean;
}) {
	const [show, setShow] = useState(false);

	return (
		<InputGroup>
			<InputGroupAddon>
				<InputGroupButton variant="secondary" size="icon-xs">
					<Icon />
				</InputGroupButton>
			</InputGroupAddon>
			<InputGroupInput
				id={id}
				name={name}
				type={show ? "text" : "password"}
				className="h-11 pr-10 pl-9"
				value={value}
				placeholder={placeholder}
				onFocus={onFocus}
				onBlur={onBlur}
				onChange={(e) => onChange(e.target.value)}
				aria-invalid={ariaInvalid}
			/>
			<InputGroupAddon align="inline-end">
				<InputGroupButton
					type="button"
					aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
					onClick={() => setShow((prev) => !prev)}
					title={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
					size="icon-xs"
				>
					{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}

// ─── Aturan keamanan password (NIST 800-63B + OWASP) ─────────────────────────

export const PASSWORD_RULES = [
	{
		id: "minLength",
		label: "Minimal 8 karakter",
		test: (v: string) => v.length >= 8,
	},
	{
		id: "uppercase",
		label: "Mengandung huruf besar (A–Z)",
		test: (v: string) => /[A-Z]/.test(v),
	},
	{
		id: "lowercase",
		label: "Mengandung huruf kecil (a–z)",
		test: (v: string) => /[a-z]/.test(v),
	},
	{
		id: "number",
		label: "Mengandung angka (0–9)",
		test: (v: string) => /[0-9]/.test(v),
	},
	{
		id: "special",
		label: "Mengandung karakter khusus (!@#$%^&* dll.)",
		test: (v: string) => /[^A-Za-z0-9]/.test(v),
	},
] as const;

export function InputPasswordChecklist({ value }: { value: string }) {
	return (
		<ul className="mt-2 space-y-1.5 rounded-md border bg-muted/50 px-3 py-2.5 text-xs">
			{PASSWORD_RULES.map((rule) => {
				const passed = rule.test(value);
				return (
					<li
						key={rule.id}
						className={`flex items-center gap-2 transition-colors ${
							passed
								? "text-emerald-600 dark:text-emerald-400"
								: "text-muted-foreground"
						}`}
					>
						{passed ? (
							<Check className="h-3.5 w-3.5 shrink-0" />
						) : (
							<X className="h-3.5 w-3.5 shrink-0" />
						)}
						{rule.label}
					</li>
				);
			})}
		</ul>
	);
}
