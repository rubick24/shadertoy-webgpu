import { GlTF, Accessor } from '../../generated/glTF'
import { TypedArrayConstructor } from '../utils'

const accessorTypeSize: Record<Accessor['type'], number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}

const componentTypedArray: Record<number, TypedArrayConstructor> = {
  5120: Int8Array, // WebGL2RenderingContext.BYTE
  5121: Uint8Array, // UNSIGNED_BYTE
  5122: Int16Array, // SHORT
  5123: Uint16Array, // UNSIGNED_SHORT
  5125: Uint32Array, // UNSIGNED_INT
  5126: Float32Array // FLOAT
}

const componentTypeSize: Record<number, number> = {
  5120: 1,
  5121: 1,
  5122: 2,
  5123: 2,
  5125: 4,
  5126: 4
}

const formatMap: Record<number, string> = {
  5120: 'sint8',
  5121: 'uint8',
  5122: 'sint16',
  5123: 'uint16',
  5125: 'uint32',
  5126: 'float32'
}

export const getAccessor = (index: number, context: { json: GlTF; buffers: ArrayBuffer[] }) => {
  const { json, buffers } = context

  const accessor = json.accessors?.[index]
  if (!accessor) {
    throw new Error('accessor not found')
  }
  const itemSize = accessorTypeSize[accessor.type]
  const bufferView = json.bufferViews![accessor.bufferView as number]
  const bufferIndex = bufferView.buffer
  const ArrayType = componentTypedArray[accessor.componentType]
  const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0)

  return {
    ...accessor,
    index,
    arrayStride: itemSize * componentTypeSize[accessor.componentType],
    format: `${formatMap[accessor.componentType]}${itemSize > 1 ? `x${itemSize}` : ''}` as GPUVertexFormat,
    bufferData: new ArrayType(buffers[bufferIndex], byteOffset, itemSize * accessor.count)
  }
}
