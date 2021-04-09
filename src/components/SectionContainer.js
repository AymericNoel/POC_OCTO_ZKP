import React from 'react';
import { MDBContainer } from 'mdbreact';
import classNames from 'classnames';

const SectionContainer = ({
  children,
  className,
  dark,
  description,
  header,
  noBorder,
  noBottom,
  style,
  title,
  flexCenter,
  flexCenterVert,
  flexColumn,
  customTitle,
}) => {
  const classes = classNames(
    'section',
    !noBottom && 'mb-5',
    !noBorder ? 'border p-3' : 'px-0',
    dark && 'grey darken-3',
    flexCenter && 'd-flex justify-content-center align-items-center',
    flexCenterVert && 'd-flex align-items-center',
    flexColumn && 'flex-column',
    className,
  );

  const descriptionDisp = description ? <p>{description}</p> : '';
  const titleDisp = title ? <h2 className='mb-3'>{title}</h2> : '';
  const headerDisp = header ? <h4 className='mb-2'>{header}</h4> : '';

  return (
    <>
      {titleDisp}
      {customTitle}
      {headerDisp}
      <MDBContainer fluid className={classes} style={style}>
        {descriptionDisp}
        {children}
      </MDBContainer>
    </>
  );
};

export default SectionContainer;
