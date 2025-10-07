import { KnownIconType as BaseKnownIconType } from "@charcoal-ui/icons";
import { ButtonHTMLAttributes } from "react";

// 🎤 Iconos adicionales que no existen en BaseKnownIconType
type ExtraIcons = {
  "24/MicFill": unknown;
  "24/MicOutline": unknown;
};

type ExtendedKnownIconType = BaseKnownIconType & ExtraIcons;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconName: keyof ExtendedKnownIconType;
  isProcessing: boolean;
  label?: string;
};

export const IconButton = ({
  iconName,
  isProcessing,
  label,
  ...rest
}: Props) => {
  return (
    <button
      {...rest}
      className={`bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled text-white rounded-16 text-sm p-8 text-center inline-flex items-center mr-2
        ${rest.className ?? ""}
      `}
    >
      {isProcessing ? (
        <pixiv-icon name={"24/Dot"} scale="1"></pixiv-icon>
      ) : (
        // 👇 Forzamos el tipo aquí para que acepte tus extras
        <pixiv-icon name={iconName as keyof BaseKnownIconType | string} scale="1"></pixiv-icon>
      )}
      {label && <div className="mx-4 font-M_PLUS_2 font-bold">{label}</div>}
    </button>
  );
};
