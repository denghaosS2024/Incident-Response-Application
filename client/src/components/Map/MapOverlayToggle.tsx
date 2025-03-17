import LayersIcon from '@mui/icons-material/Layers'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import IconButton from '@mui/material/IconButton'

export default function MapOverlayToggle({
  isVisible,
  onToggle,
}: {
  isVisible: boolean
  onToggle: () => void
}) {
  return (
    <IconButton onClick={onToggle}>
      {isVisible ? (
        <LayersClearIcon fontSize="small" />
      ) : (
        <LayersIcon fontSize="small" />
      )}
    </IconButton>
  )
}
