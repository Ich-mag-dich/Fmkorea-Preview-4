/** 화면에 보이는 숫자 형식. 1234567 → "1,234,567" */
export const formatNumber = (n: number) => n.toLocaleString("ko-KR");

/** 20261007024626 → "2026-10-07 02:46:26" */
export const formatRegdate = (regdate: number) =>
  String(regdate).replace(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "$1-$2-$3 $4:$5:$6",
  );
