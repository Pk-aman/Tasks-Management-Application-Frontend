import { Avatar, Tooltip, type SxProps, type Theme } from "@mui/material";

const getMemberInitials = (name?: string) => {
    if(!name) name = 'Unknown'
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export const ProfileAvatar = ({ name, sx }: { name?: string, sx?: SxProps<Theme>;}) => {
  return (
    <Tooltip title={name}>
      <Avatar sx={sx}>
        {getMemberInitials(name)}
      </Avatar>
    </Tooltip>
  );
};
