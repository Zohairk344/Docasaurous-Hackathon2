// src/theme/NavbarItem/ComponentTypes.tsx
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import NavbarAuth from '@site/src/components/NavbarAuth';

export default {
  ...ComponentTypes,
  'custom-AuthButton': NavbarAuth,
};