import { getForbiddenSectionMessage, getPartialForbiddenSectionMessage } from "@/utils/forbidden-message";

type ForbiddenSectionNoticeProps = {
  area?: string;
  variant?: "forbidden" | "partial";
};

export function ForbiddenSectionNotice({
  area,
  variant = "forbidden",
}: ForbiddenSectionNoticeProps) {
  return (
    <span>
      {variant === "partial"
        ? getPartialForbiddenSectionMessage(area)
        : getForbiddenSectionMessage(area)}
    </span>
  );
}
