import React from 'react';

interface Props {
  page: string;
}

const Pages = ({ page }: Props) => {
  return (
    <div>{page}</div>
  );
};

export default Pages;
