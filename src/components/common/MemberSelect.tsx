import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Popover,
  Typography,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { FilterListOutlined, SearchOutlined, CloseOutlined } from '@mui/icons-material';
import type { MultiSelectFilterProps } from '../../utils';
import { ProfileAvatar } from './ProfileAvatar';

export const MemberSelect = ({
  label,
  options,
  selectedIds,
  onChange,
}: MultiSelectFilterProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleToggle = (optionId: string) => {
    const currentIndex = selectedIds.indexOf(optionId);
    const newSelected = [...selectedIds];

    if (currentIndex === -1) {
      newSelected.push(optionId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onChange(newSelected);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt._id));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'member-select-popover' : undefined;

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        (option.label && option.label.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  const isAllFilteredSelected = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((opt) => selectedIds.includes(opt._id));
  }, [filteredOptions, selectedIds]);

  const displayBadge = selectedIds.length > 0;

  return (
    <>
      <Badge
        badgeContent={displayBadge ? selectedIds.length : 0}
        color="primary"
        invisible={!displayBadge}
      >
        <Button
          variant="outlined"
          startIcon={<FilterListOutlined />}
          onClick={handleClick}
          sx={{
            textTransform: 'none',
            borderColor: displayBadge ? '#10B981' : undefined,
            color: displayBadge ? '#10B981' : undefined,
            '&:hover': {
              borderColor: '#10B981',
              bgcolor: '#F0FDF4',
            },
          }}
        >
          {label}
        </Button>
      </Badge>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 350,
            maxHeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              {label}
            </Typography>
            <Box display="flex" gap={0.5}>
              {isAllFilteredSelected ? (
                <Button
                  size="small"
                  onClick={handleDeselectAll}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1,
                    color: '#0066FF',
                  }}
                >
                  Deselect All
                </Button>
              ) : (
                <Button
                  size="small"
                  onClick={handleSelectAll}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1,
                    color: '#0066FF',
                  }}
                >
                  Select All
                </Button>
              )}
            </Box>
          </Box>

          {/* Search Box with X icon */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ p: 0.5 }}
                  >
                    <CloseOutlined fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Divider */}
          <Box sx={{ borderBottom: '1px solid #E5E7EB', mb: 2 }} />

          {/* Options List */}
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((option, index) => {
                  // ✅ Use index as fallback if _id is undefined
                  const uniqueKey = option._id || `option-${index}`;
                  const isChecked = selectedIds.includes(option._id);

                  return (
                    <Box
                      key={uniqueKey}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1,
                        px: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#F9FAFB',
                        },
                      }}
                      onClick={() => handleToggle(option._id)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggle(option._id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          color: '#10B981',
                          padding: 0,
                          mr: 1.5,
                          '&.Mui-checked': {
                            color: '#10B981',
                          },
                        }}
                      />
                      <ProfileAvatar name={option.name} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {option.label || option.name}
                      </Typography>
                    </Box>
                  );
                })}
              </>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                py={3}
              >
                {searchQuery ? 'No results found' : 'No options available'}
              </Typography>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
};
