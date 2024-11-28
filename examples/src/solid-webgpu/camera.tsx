import { createToken } from '@solid-primitives/jsx-tokenizer'
import { DEG2RAD, Mat4 } from 'math'
import { createEffect, mergeProps, splitProps } from 'solid-js'
import { useSceneContext } from './context'
import { createObject3DContext, Object3DProps } from './object3d'
import { tokenizer, useToken } from './tokenizer'
import { CameraContext, Token } from './types'

export const isCamera = (v: Token) => v.type.includes('Camera')

export type CameraProps = Object3DProps

export const Camera = createToken(tokenizer, (props: CameraProps) => {
  const token = useToken(['Camera', 'Object3D'], props)
  createObject3DContext(token, props)

  const [_, setSceneContext] = useSceneContext()

  const context: CameraContext = {
    projectionMatrix: new Mat4(),
    viewMatrix: new Mat4(),
    projectionViewMatrix: new Mat4(),
    _lookAtMatrix: new Mat4()
  }

  setSceneContext('camera', token.id, context)

  //   lookAt: (target: Vec3) => {
  //     Mat4.targetTo(token._lookAtMatrix, token.position, target, token.up)
  //     Mat4.getRotation(token.quaternion, token._lookAtMatrix)
  //   }

  return token
})

export type PerspectiveCameraProps = CameraProps & {
  fov?: number
  aspect?: number
  near?: number
  far?: number
}
export const PerspectiveCamera = (props: PerspectiveCameraProps) => {
  const [_local, others] = splitProps(props, ['ref', 'fov', 'aspect', 'near', 'far'])

  const local = mergeProps(
    {
      fov: 75 * DEG2RAD,
      aspect: 1,
      near: 0.1,
      far: 1000
    },
    _local
  ) as Required<PerspectiveCameraProps>

  let camera!: Token

  const [_, setSceneContext] = useSceneContext()

  createEffect(() => {
    const m = Mat4.create()
    Mat4.perspectiveZO(m, local.fov, local.aspect, local.near, local.far)
    setSceneContext('camera', camera.id, 'projectionMatrix', m)
  })

  return (
    <Camera
      {...others}
      ref={v => {
        camera = v
        local.ref?.(v)
      }}
    />
  )
}

export type OrthographicCameraProps = CameraProps & {
  near?: number
  far?: number
  left?: number
  right?: number
  bottom?: number
  top?: number
}
export const OrthographicCamera = (props: OrthographicCameraProps) => {
  const [_local, others] = splitProps(props, ['ref', 'near', 'far', 'left', 'right', 'bottom', 'top'])

  const local = mergeProps(
    {
      near: 0.1,
      far: 1000,
      left: -1,
      right: 1,
      bottom: -1,
      top: 1
    },
    _local
  ) as Required<OrthographicCameraProps>

  let camera!: CameraToken

  createEffect(() => {
    Mat4.orthoZO(camera.projectionMatrix, local.left, local.right, local.bottom, local.top, local.near, local.far)
  })

  return (
    <Camera
      {...others}
      ref={v => {
        camera = v
        local.ref?.(v)
      }}
    />
  )
}
