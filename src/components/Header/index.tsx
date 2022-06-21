import Link from 'next/link';
// import commonStyles from '../../styles/common.module.scss';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  // TODO
  return (
    <header className={`${styles.headerContainer} ${commonStyles.container}`}>
      {/* <div className={commonStyles.container}> */}
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
      {/* </div> */}
    </header>
  );
}
